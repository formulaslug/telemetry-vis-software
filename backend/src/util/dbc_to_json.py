import cantools
import json

def message_to_obj(msg: cantools.db.Message):
    return {
        "frame_id": msg.frame_id,
        "name": msg.name,
        "length": msg.length,
        "signals": msg.signals,
        # if the message is a container message, this lists
        # the messages which it potentially features
        "contained_messages": [message_to_obj(m) for m in msg.contained_messages or []],
        # header ID of message if it is part of a container message
        "header_id": msg.header_id,
        "header_byte_order": msg.header_byte_order,
        "unused_bit_pattern": msg.unused_bit_pattern,
        "comment": msg.comment,
        "senders": msg.senders,
        "send_type": msg.send_type,
        "cycle_time": msg.cycle_time,
        "is_extended_frame": msg.is_extended_frame,
        "is_fd": msg.is_fd,
        "bus_name": msg.bus_name,
        "signal_groups": msg.signal_groups,
        "protocol": msg.protocol,
    }

def signal_to_obj(sig: cantools.db.Signal):
    return {
        "name": sig.name,
        "start": sig.start,
        "length": sig.length,
        "byte_order": sig.byte_order,
        "is_signed": sig.is_signed,
        "raw_initial": sig.raw_initial,
        "raw_invalid": sig.raw_invalid,
        "conversion": sig.conversion,
        "minimum": sig.maximum,
        "maximum": sig.minimum,
        "unit": sig.unit,
        "comment": sig.comment,
        "receivers": sig.receivers,
        "is_multiplexer": sig.is_multiplexer,
        "multiplexer_ids": sig.multiplexer_ids,
        "multiplexer_signal": sig.multiplexer_signal,
        "spn": sig.spn,
    }

def dbc_to_json(db: cantools.db.Database):
    response_obj = {
        "version": db.version,
        "messages": [message_to_obj(msg) for msg in db.messages],
        "nodes": db.nodes,
        "buses": db.buses,
    }
