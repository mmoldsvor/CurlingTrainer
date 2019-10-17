from Processing import Node, Vector2D, ProcessingUnit


if __name__ == '__main__':
    from Processing.analysis import AnalysisTool

    nodes = [Node(Vector2D(410, 90), 'COM4', 100), Node(Vector2D(90, 90), 'COM9', 100)]
    processing_unit = ProcessingUnit(nodes, (100, 100, 400, 400))

    while True:
        analysisTool = AnalysisTool()
        analysisTool.update_display(processing_unit.tracking_area, nodes)

        position = processing_unit.position
        if position is not None:
            analysisTool.draw_point(position)
        analysisTool.update()
